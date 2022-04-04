<script lang="ts">
    import { decryptData } from "src/utils/aes";

    export let username: string;
    export let id: string;
    export let iv: string;
    export let name: string;
    export let type: string;

    export let keys: CryptoKey;

    const received = new Date().toLocaleTimeString();

    const dlUrl: string = `${process.env.API_URL}/efile/${id}`;

    const doDecrypt = async () => {
        const res = await fetch(dlUrl);

        if (res.status !== 200) {
            alert("Unable to download and decrypt file.");
            return;
        }

        // get arraybuffer
        const arrayBuffer = await res.arrayBuffer();

        // decrypt
        const decrypted = await decryptData({ iv, data: arrayBuffer }, keys);

        const blob = new Blob([decrypted], {
            type,
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
    };
</script>

<div class="container">
    <div style="display: flex; align-items: center;">
        <p class="username">
            {username}
        </p>
        <p class="timestamp">{received}</p>
    </div>
    <div>
        <p class="content">I've shared an encrypted file with you.</p>
        <div class="downloadButton">
            <p on:click={doDecrypt} style="margin: 0; padding: 0">Download {name.length > 30 ? `${name.substring(0, 30)}...` : name}</p>
        </div>
    </div>
</div>

<style lang="scss">
    .downloadButton {
        user-select: none;
        height: 1rem;
        width: fit-content;
        padding: .5rem;
        background-color: #0572ec;
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        font-size: 1rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition-duration: 250ms;
        &:hover {
            background-color: #014ba0;
        }
        &:active {
            background-color: #00326b;
        }
    }

    .username {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0;
        color: var(--txt-color);
    }

    .timestamp {
        @extend .username;
        font-size: 0.75rem;
        margin-left: 0.5rem;
        color: gray;
    }

    .container {
        display: flex;
        flex-direction: column;
    }

    .content {
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>
