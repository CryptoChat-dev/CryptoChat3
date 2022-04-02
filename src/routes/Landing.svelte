<script lang="ts">
    let username: string = "";

    let roomKey: string = "";

    const doJoin = async () => {
        window.localStorage.setItem("username", username);
        window.localStorage.setItem("roomKey", roomKey);
    };
</script>

<body>
    <div class="container">
        <h1>CryptoChat 3.0</h1>
        <h2>Simple, secure and ephemeral anonymous messaging.</h2>
        <input type="text" placeholder="Username" bind:value={username} />
        <input type="text" placeholder="Room Key" bind:value={roomKey} />
        <button on:click={doJoin}>Join</button>
    </div>
</body>

<style lang="scss">
    body {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .container {
        text-align: center;
        display: flex;
        flex-direction: column;
    }
</style>
