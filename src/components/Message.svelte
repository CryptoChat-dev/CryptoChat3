<script lang="ts">
    export let username: string = "";

    export let content: string = "";

    export let isSystem: boolean = false;

    export let requiresDecryption: boolean = true;

    const received: string = new Date().toLocaleTimeString();
</script>

<div class="container">
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
            {username}
        </p>
        <p class="timestamp">{received}</p>
    </div>
    <p class="content">{content}</p>
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
