<script lang="ts">
    import { decryptData } from "src/utils/aes";

    export let username: string;
    export let id: string;
    export let iv: string;
    export let name: string;

    export let keys: CryptoKey;

    const received = new Date().toLocaleTimeString();

    const dlUrl: string = `${process.env.API_URL}/efile/${id}`;

    const doDecrypt = async () => {
        const res = await fetch(dlUrl);
        // get arraybuffer
        const arrayBuffer = await res.arrayBuffer();

        // decrypt
        const decrypted = await decryptData({ iv, data: arrayBuffer }, keys);

        const blob = new Blob([decrypted], {
            type: "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "file";
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
    <p class="content">
        I've shared a file with you! <a on:click={doDecrypt}
            >Download {name}</a
        >
    </p>
</div>

<style lang="scss">
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
