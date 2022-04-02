<script lang="ts">
    import GiPerspectiveDiceSixFacesTwo from "svelte-icons/gi/GiPerspectiveDiceSixFacesTwo.svelte";

    import { getDicewareWords } from "../utils/password";

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
        <div class="textGroup">
            <input type="text" placeholder="Username" bind:value={username} />
            <div
                class="icon"
                on:click={async () => {
                    username = await getDicewareWords(2, false);
                }}
            >
                <GiPerspectiveDiceSixFacesTwo />
            </div>
        </div>
        <div class="textGroup">
            <input type="text" placeholder="Room Key" bind:value={roomKey} />
            <div
                class="icon"
                on:click={async () => {
                    roomKey = await getDicewareWords(7, true);
                }}
            >
                <GiPerspectiveDiceSixFacesTwo />
            </div>
        </div>

        <button on:click={doJoin}>Join</button>
    </div>
</body>

<style lang="scss">
    :global(.icon) {
        height: 3rem;
        width: 3rem;
        cursor: pointer;

        transition-duration: 200ms;

        &:hover {
            color: #b2b2b2;
        }
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .textGroup {
        display: flex;
        width: 100%;
        align-items: center;
        margin-bottom: 1rem;
    }

    .container {
        text-align: center;
        display: flex;
        flex-direction: column;
        width: 30rem;
    }
</style>
