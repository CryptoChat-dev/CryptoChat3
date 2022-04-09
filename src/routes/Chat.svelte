<script lang="ts">
    import { SHA512 } from "jscrypto/es6/SHA512";

    import Message from "@components/Message.svelte";

    import FaArrowAltCircleUp from "svelte-icons/fa/FaArrowAltCircleUp.svelte";

    import { decrypt, deriveKeypair, encrypt } from "@utils/aes.ts";

    import { onDestroy, onMount } from "svelte";

    import { socket } from "@utils/socket.ts";

    import switchTheme from "@utils/theme.ts";

    import FaCloudUploadAlt from "svelte-icons/fa/FaCloudUploadAlt.svelte";
    import { encryptData } from "src/utils/aes";

    import FileMessage from "@components/File.svelte";

    import type { Word32Array } from "jscrypto/es6/lib/Word32Array";

    // get username and roomKey from localStorage
    const username: string = window.localStorage.getItem("username");
    const roomKey: string = window.localStorage.getItem("roomKey");

    let message: string = "";

    interface encryptedMessageData {
        username: { iv: string; data: string };
        content: { iv: string; data: string };
        isSystem?: boolean;
        requiresDecryption?: boolean;
        key?: CryptoKey;
    }

    interface eventData {
        type: string;
        data: encryptedMessageData | encryptedFileData;
    }

    interface encryptedFileData {
        username: string;
        id: string;
        iv: string;
        name: string;
        type: string;
        key: CryptoKey;
    }

    let messages: eventData[] = [];

    // hash the roomKey with SHA-512
    let hashedRoomKey: string;
    let rawHashedRoomKey: Word32Array;
    rawHashedRoomKey = SHA512.hash(roomKey);

    for (let i = 0; i < 500; i++) {
        rawHashedRoomKey = SHA512.hash(rawHashedRoomKey);
    }

    hashedRoomKey = rawHashedRoomKey.toString();

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const doSend = async () => {
        if (!username || !roomKey || !message) {
            return;
        }

        // process commands
        switch (message) {
            case "/debug":
                console.log("username:", username);
                console.log("roomKey:", roomKey);
                console.log("hashedRoomKey:", hashedRoomKey);
                messages = [
                    ...messages,
                    {
                        type: "message",
                        data: {
                            isSystem: true,
                            username: { iv: "", data: "System" },
                            content: {
                                iv: "",
                                data: `Username: ${username}\n\nRoom Key: ${roomKey}\n\nHashed Room Key: ${hashedRoomKey}`,
                            },
                            requiresDecryption: false,
                        },
                    },
                ];
                message = "";
                return;
            case "/clear":
                messages = [];
                message = "";
                return;
            case "/theme":
                switchTheme();
                message = "";
                return;
            case "/quit":
            case "/exit":
            case "/leave":
                window.location.href = "/";
                return;
        }

        // create random aes 256 gcm key and send it with the message encrypted
        const messageKeypair: CryptoKey =
            await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true,
                ["encrypt", "decrypt"]
            );

        // export the key as raw
        const messageKeyRaw: ArrayBuffer = await window.crypto.subtle.exportKey(
            "raw",
            messageKeypair
        );

        const encryptedMessageKey: { iv: string; data: string } = await encrypt(
            messageKeyRaw,
            keys
        );

        // encrypt username
        const encryptedUsername: { iv: string; data: string } = await encrypt(
            enc.encode(username),
            messageKeypair
        );

        // encrypt message
        const encryptedMessage: { iv: string; data: string } = await encrypt(
            enc.encode(message),
            messageKeypair
        );

        socket.emit("chat event", {
            roomName: hashedRoomKey,
            username: encryptedUsername,
            message: encryptedMessage,
            key: encryptedMessageKey,
        });

        message = "";
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
        if (e.key == "Enter") {
            await doSend();
        }
    };

    let keys: CryptoKey;

    onMount(async () => {
        if (!username || !roomKey) {
            return;
        }

        // derive keypair
        keys = await deriveKeypair(roomKey, hashedRoomKey);

        // encrypt username
        const encryptedUsername: { iv: string; data: string } = await encrypt(
            enc.encode(username),
            keys
        );

        // send join
        socket.emit("join", {
            roomName: hashedRoomKey,
            username: encryptedUsername,
        }); // Emit the join event

        socket.on("chat response", messageHandler);
        socket.on("join response", joinHandler);
        socket.on("leave response", leaveHandler);
        socket.on("file response", fileHandler);
        // socket.on('user count', userCountHandler);

        // do something every 10s
        setInterval(() => {
            doKeepAlive();
        }, 10000);
    });

    onDestroy(() => {
        socket.off("chat response");
        socket.off("file response");
        socket.off("join response");
        socket.off("leave response");
        // socket.off('user count');
    });

    const leaveHandler = async (msg: { id: string; username: string }) => {
        // parse message
        const { id, username } = msg;

        const usernameJson: {
            iv: string;
            data: string;
        } = JSON.parse(username);

        // decrypt username
        const decryptedUsername: string = dec.decode(
            await decrypt(usernameJson, keys)
        );

        // add message
        messages = [
            ...messages,
            {
                type: "message",
                data: {
                    isSystem: true,
                    username: { iv: "", data: "System" },
                    content: {
                        iv: "",
                        data: `${decryptedUsername} (${id}) has left the chat.`,
                    },
                    requiresDecryption: false,
                },
            },
        ];
    };

    const joinHandler = async (msg: {
        username: { iv: string; data: string };
        id: string;
    }) => {
        // decrypt username
        const decryptedUsername: ArrayBuffer = await decrypt(
            msg.username,
            keys
        );

        messages = [
            ...messages,
            {
                type: "message",
                data: {
                    isSystem: true,
                    username: { iv: "", data: "System" },
                    content: {
                        iv: "",
                        data: `${dec.decode(decryptedUsername)} (${
                            msg.id
                        }) has joined the room.`,
                    },
                    requiresDecryption: false,
                },
            },
        ];
    };

    interface messageFromServer {
        username: { iv: string; data: string };
        message: { iv: string; data: string };
        key: { iv: string; data: string };
    }

    let messageRef: HTMLDivElement;

    const messageHandler = async (msg: messageFromServer) => {
        const parsedData: encryptedMessageData = {
            username: msg.username,
            content: msg.message,
            isSystem: false,
            requiresDecryption: true,
            key: await window.crypto.subtle.importKey(
                "raw",
                await decrypt(msg.key, keys),
                {
                    name: "AES-GCM",
                    length: 256,
                },
                false,
                ["decrypt"]
            ),
        };

        messages = [...messages, { type: "message", data: parsedData }];
        // wait 5 ms because the DOM is not ready yet
        await new Promise((resolve) => setTimeout(resolve, 5));
        messageRef.scrollTop =
            messageRef.scrollHeight + messageRef.clientHeight;
    };

    const doLeave = async () => {
        window.localStorage.clear();
        // go to landing page
        window.location.href = "/";
    };

    const doKeepAlive = async () => {
        socket.emit("keepalive", {
            roomName: hashedRoomKey,
        });
    };

    document.documentElement.setAttribute(
        "data-theme",
        window.localStorage.getItem("theme")
    );

    let input: HTMLInputElement;

    const doFileUpload = async (e: InputEvent) => {
        // get file from input
        const file: File = (e.target as HTMLInputElement).files[0];

        // get file data
        let reader = new FileReader();

        reader.readAsArrayBuffer(file);

        reader.onload = async () => {
            const fileData: ArrayBuffer = reader.result as ArrayBuffer;

            const fileKey: CryptoKey = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256,
                },
                true,
                ["encrypt", "decrypt"]
            );

            // export the key as raw
            const fileKeyRaw: ArrayBuffer =
                await window.crypto.subtle.exportKey("raw", fileKey);

            const encryptedFileKey: { iv: string; data: string } =
                await encrypt(fileKeyRaw, keys);

            // encrypt file data
            const encryptedFileData: { iv: string; data: ArrayBuffer } =
                await encryptData(fileData, fileKey);

            const formData: FormData = new FormData();
            formData.append("efile", new Blob([encryptedFileData.data]));

            const request = await fetch(`${process.env.API_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            if (request.status === 200) {
                const response: { uuid: string } = await request.json();

                const encryptedUsername: { iv: string; data: string } =
                    await encrypt(enc.encode(username), keys);

                const encryptedName: { iv: string; data: string } =
                    await encrypt(enc.encode(file.name), keys);

                const encryptedType: { iv: string; data: string } =
                    await encrypt(enc.encode(file.type), keys);

                socket.emit("file event", {
                    roomName: hashedRoomKey,
                    username: encryptedUsername,
                    id: response.uuid,
                    iv: encryptedFileData.iv,
                    name: encryptedName,
                    type: encryptedType,
                    key: encryptedFileKey,
                });
            } else {
                alert("Unable to upload file.");
            }
        };
    };

    const fileHandler = async (msg: {
        username: { iv: string; data: string };
        iv: string;
        id: string;
        name: { iv: string; data: string };
        type: { iv: string; data: string };
        key: { iv: string; data: string };
    }) => {
        // decrypt username
        const decryptedUsername: string = dec.decode(
            await decrypt(msg.username, keys)
        );

        const decryptedName: string = dec.decode(
            await decrypt({ iv: msg.name.iv, data: msg.name.data }, keys)
        );

        const decryptedType: string = dec.decode(
            await decrypt({ iv: msg.type.iv, data: msg.type.data }, keys)
        );

        // decrypt key
        const decryptedKey: ArrayBuffer = await decrypt(
            { iv: msg.key.iv, data: msg.key.data },
            keys
        );

        messages = [
            ...messages,
            {
                type: "file",
                data: {
                    username: decryptedUsername,
                    id: msg.id,
                    iv: msg.iv,
                    name: decryptedName,
                    type: decryptedType,
                    key: await window.crypto.subtle.importKey(
                        "raw",
                        decryptedKey,
                        {
                            name: "AES-GCM",
                            length: 256,
                        },
                        true,
                        ["decrypt"]
                    ),
                },
            },
        ];
    };
</script>

<div class="container">
    <div class="infoBar">
        <div class="keyInfo">
            <p>Room Key:</p>
            <p class="roomKey">{roomKey}</p>
        </div>
    </div>
    <div class="titles">
        <h1 style="margin: 0; font-size: 3rem;">CryptoChat</h1>
        <h2 style="margin: 0;">A stunning encrypted chat app.</h2>
    </div>
    <div class="chatBox" bind:this={messageRef}>
        {#each messages as message}
            {#if message.type === "message"}
                <!-- group messages depending on author -->
                <Message {keys} {...message.data} />
            {:else if message.type === "file"}
                <FileMessage {...message.data} />
            {/if}
        {/each}
    </div>
    <div class="messageBox">
        <input
            style="color: var(--text-color);"
            on:keydown={handleKeyDown}
            bind:value={message}
            class="messageInput override"
            placeholder="What's up?"
        />
        <div class="inputIcon icon" on:click={() => input.click()}>
            <FaCloudUploadAlt />
        </div>
        <div class="inputIcon icon" on:click={doSend}>
            <FaArrowAltCircleUp />
        </div>
    </div>
    <div class="buttons">
        <button on:click={switchTheme}>Theme</button>
        <button on:click={doLeave}>Leave</button>
    </div>
</div>

<input
    type="file"
    style="display: none;"
    on:change={doFileUpload}
    bind:this={input}
/>

<style lang="scss">

    :global(body) {
        padding: 0;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;

        @media only screen and (max-width: 800px) {
            margin-bottom: 2rem;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
        }
    }

    .inputIcon {
        padding: 0.5rem;
        border-radius: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--text-color);
    }

    .messageBox {
        height: fit-content;
        display: flex;
        margin-top: 1rem;

        border-radius: 25px;
        box-shadow: inset 8px 8px 8px var(--inside-box-shadow-one),
            inset -8px -8px 8px var(--inside-box-shadow-two);

        align-items: center;
    }

    .messageInput {
        width: 100%;
        background: transparent;
        border: none;

        color: white;

        &:focus {
            outline: none;
        }

        padding: 20px 20px 20px 20px;

        font-size: 1rem;
    }

    .container {
        /* height: 45rem; */
        height: fit-content;
        width: 50rem;
        border-radius: 50px;
        background: var(--main-background);
        box-shadow: 20px 20px 60px var(--first-box-shadow),
            -20px -20px 60px var(--second-box-shadow);

        display: flex;
        flex-direction: column;
        padding: 1.5rem 2.5rem 1.5rem 2.5rem;

        @media only screen and (max-width: 800px) {
            width: 100%;
            height: 100%;
            border-radius: 0;
            padding: .5rem;
            box-sizing: border-box;
        }

    }

    .infoBar {
        display: flex;
        width: 100%;
        height: 3rem;
    }

    .keyInfo {
        display: flex;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .roomKey {
        margin-left: 0.5rem;

        // blur
        filter: blur(5px);

        transition-duration: 250ms;

        &:hover {
            filter: none;
        }
    }

    .titles {
        display: flex;
        flex-direction: column;
    }

    .chatBox {
        height: 20rem;
        border-radius: 25px;
        box-shadow: inset 8px 8px 8px var(--inside-box-shadow-one),
            inset -8px -8px 8px var(--inside-box-shadow-two);
        width: 100%;
        box-sizing: border-box;
        border: none;
        outline: none;
        background: none;
        font-size: 18px;
        padding: 20px;
        overflow-y: auto;
        overflow-x: hidden;
        color: var(--txt-color);
        display: flex;
        flex-direction: column;
        margin-top: 1rem;

        @media only screen and (max-width: 800px) {
            height: 100%;
        }
    }
</style>
