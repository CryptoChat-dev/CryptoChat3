<script lang="ts">
    import { decrypt } from "@utils/aes.ts";

    import { onMount } from "svelte";

    export let username: { iv: string; data: string };

    export let content: { iv: string; data: string };

    export let isSystem: boolean = false;

    export let requiresDecryption: boolean = true;

    export let key: CryptoKey;

    export let group: boolean = false;

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
        decryptedUsername = dec.decode(await decrypt(username, key));

        // decrypt content
        decryptedMessage = dec.decode(await decrypt(content, key));
    });
</script>

<div class="container">
    {#if decryptedMessage && decryptedUsername}
        {#if isSystem}
            <p style="color: gray; font-size: .75rem; margin: 0;">
                ONLY YOU CAN SEE THIS
            </p>
        {/if}
        {#if !group}
            <div style="display: flex; align-items: center;">
                <p
                    class="username"
                    style={`color: ${
                        isSystem ? "#C081FF" : "var(--txt-color)"
                    }`}
                >
                    {decryptedUsername}
                </p>
                <p class="timestamp">{received}</p>
            </div>
        {/if}
        <p class={`content ${group && "no-margin"}`}>{decryptedMessage}</p>
    {/if}
</div>

<style lang="scss">
    .no-margin {
        margin: 0;
    }

    .username {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0;
        margin-top: 1rem;
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
        margin-bottom: 0;
    }
</style>
