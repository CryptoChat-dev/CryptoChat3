<script lang="ts">
    import { SHA512 } from "jscrypto/es6/SHA512";
    import Message from "../components/Message.svelte";

    import FaArrowAltCircleUp from "svelte-icons/fa/FaArrowAltCircleUp.svelte";

    import { decrypt, deriveKeypair, encrypt } from "../utils/aes";

    import { onDestroy, onMount } from "svelte";

    import { socket } from "../utils/socket";

    // get username and roomKey from localStorage
    const username: string = window.localStorage.getItem("username");
    const roomKey: string = window.localStorage.getItem("roomKey");

    let message: string = "";

    interface encryptedMessageData {
        username: { iv: string; data: string };
        content: { iv: string; data: string };
        isSystem?: boolean;
        requiresDecryption?: boolean;
    }

    let messages: encryptedMessageData[] = [];

    // hash the roomKey with SHA-512
    const hashedRoomKey: string = SHA512.hash(roomKey).toString();

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
                        isSystem: true,
                        username: { iv: "", data: "System" },
                        content: {
                            iv: "",
                            data: `Username: ${username}\n\nRoom Key: ${roomKey}\n\nHashed Room Key: ${hashedRoomKey}`,
                        },
                        requiresDecryption: false,
                    },
                ];
                message = "";
                return;
            case "/clear":
                messages = [];
                message = "";
                return;
        }

        // encrypt username
        const encryptedUsername: { iv: string; data: string } = await encrypt(
            enc.encode(username),
            keys
        );

        // encrypt message
        const encryptedMessage: { iv: string; data: string } = await encrypt(
            enc.encode(message),
            keys
        );

        socket.emit("chat event", {
            roomName: hashedRoomKey,
            username: encryptedUsername,
            message: encryptedMessage,
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

        const apiUrl = API_URL;

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
        // socket.on('user count', userCountHandler);

        // do something every 10s
        setInterval(() => {
            doKeepAlive();
        }, 10000);
    });

    onDestroy(() => {
        socket.off("chat response");
        // socket.off('file response');
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
                isSystem: true,
                username: { iv: "", data: "System" },
                content: {
                    iv: "",
                    data: `${decryptedUsername} (${id}) has left the chat.`,
                },
                requiresDecryption: false,
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
        ];
    };

    interface messageFromServer {
        username: { iv: string; data: string };
        message: { iv: string; data: string };
    }

    let messageRef: HTMLDivElement;

    const messageHandler = async (msg: messageFromServer) => {
        const parsedData: encryptedMessageData = {
            username: msg.username,
            content: msg.message,
            isSystem: false,
            requiresDecryption: true,
        };

        messages = [...messages, parsedData];
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
        <h2 style="margin: 0;">A stunning encrypted webapp.</h2>
    </div>
    <div class="chatBox" bind:this={messageRef}>
        {#each messages as message}
            <!-- group messages depending on author -->
            <Message {keys} {...message} />
        {/each}
    </div>
    <div class="messageBox">
        <input
            on:keydown={handleKeyDown}
            bind:value={message}
            class="messageInput override"
            placeholder="What's up?"
        />
        <div class="inputIcon icon" on:click={doSend}>
            <FaArrowAltCircleUp />
        </div>
    </div>
    <div class="buttons">
        <button>Theme</button>
        <button on:click={doLeave}>Leave</button>
    </div>
</div>

<style lang="scss">
    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
    }

    .inputIcon {
        color: white;
        padding: 0.5rem;
        border-radius: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
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
    }

    .infoBar {
        display: flex;
        width: 100%;
        height: 3rem;
    }

    .keyInfo {
        display: flex;
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
        /* height: 40%; */
        height: 20rem;
        border-radius: 25px;
        box-shadow: inset 8px 8px 8px var(--inside-box-shadow-one),
            inset -8px -8px 8px var(--inside-box-shadow-two);
        width: 98%;
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
    }
</style>
