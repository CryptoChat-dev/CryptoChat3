<script lang="ts">
    import { decrypt } from "@utils/aes.ts";

    import { onMount } from "svelte";

    export let username: { iv: string; data: string };

    export let content: { iv: string; data: string };

    export let isSystem: boolean = false;

    export let keys: CryptoKey;

    export let requiresDecryption: boolean = true;

    const received: string = new Date().toLocaleTimeString();

    let decryptedMessage: string;

    let decryptedUsername: string;

    const dec = new TextDecoder();

    onMount(async () => {
        if (!username || !content) {
            return;
        }

        if (!requiresDecryption) {
            decryptedUsername = username.data;
            decryptedMessage = content.data;
            return;
        }

        // decrypt username
        decryptedUsername = dec.decode(await decrypt(username, keys));

        // decrypt content
        decryptedMessage = dec.decode(await decrypt(content, keys));
    });
</script>

<div class="container">
    {#if decryptedMessage && decryptedUsername}
        {#if isSystem}
            <p style="color: gray; font-size: .75rem; margin: 0;">
                ONLY YOU CAN SEE THIS
            </p>
        {/if}
        <div style="display: flex; align-items: center;">
            <p
                class="username"
                style={`color: ${isSystem ? "#C081FF" : "var(--txt-color)"}`}
            >
                {decryptedUsername}
            </p>
            <p class="timestamp">{received}</p>
        </div>
        <p class="content">{decryptedMessage}</p>
    {/if}
</div>

<style lang="scss">
    .username {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0;
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
