<script lang="ts">
    import GiPerspectiveDiceSixFacesTwo from "svelte-icons/gi/GiPerspectiveDiceSixFacesTwo.svelte";

    import { getDicewareWords, scorePassword } from "@utils/password.ts";

    import switchTheme from "@utils/theme.ts";

    import KeyAlert from "@components/KeyAlert.svelte";

    import UnsupportedAlert from "@components/UnsupportedAlert.svelte";

    import type Dexie from "dexie";
    import History from "@components/History.svelte";

    let username: string = "";

    let roomKey: string = "";

    let showAlert: boolean = false;

    export let db: Dexie;

    const doJoin = async (bypass: boolean = false) => {
        if (!username || !roomKey) {
            return;
        }

        const passwordScore: number = await scorePassword(roomKey);

        if (passwordScore < 85 && !bypass) {
            // insecure
            showAlert = true;
            return;
        }

        window.localStorage.setItem("username", username);
        window.localStorage.setItem("roomKey", roomKey);

        // add to history
        db["history"].add({
            username,
            key: roomKey,
            timestamp: Date.now(),
        });

        // check if there are more than 3 entries
        const history: Array<{
            username: string;
            key: string;
            timestamp: number;
            id: number;
        }> = await db["history"].toArray();

        if (history.length > 3) {
            // remove oldest entry
            db["history"].delete(history[0].id);
        }

        window.location.href = "/chat";
    };

    document.documentElement.setAttribute(
        "data-theme",
        window.localStorage.getItem("theme")
    );

    let showHistory: boolean = false;
</script>

{#if !window.crypto || !window.crypto.subtle}
    <UnsupportedAlert />
{/if}

{#if showAlert}
    <KeyAlert
        dismiss={() => (showAlert = false)}
        override={() => doJoin(true)}
    />
{/if}

{#if showHistory}
    <History
        {db}
        dismiss={() => {
            showHistory = false;
        }}
    />
{/if}

<div class="container">
    <div class="imageParent">
        <img src="/logo.svg" alt="CryptoChat Logo" />
    </div>
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
    <div class="buttons">
        <button on:click={switchTheme}>Theme</button>
        <button
            on:click={() => {
                showHistory = true;
            }}>History</button
        >
        <button on:click={() => doJoin(false)}>Join</button>
    </div>
</div>

<style lang="scss">
    .buttons {
        display: flex;
        justify-content: space-between;
    }

    .imageParent {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    img {
        width: 10rem;
        margin-bottom: 2rem;
        user-select: none;
        -webkit-user-drag: none;
    }
    :global(.icon) {
        height: 3rem;
        width: 3rem;
        cursor: pointer;

        transition-duration: 200ms;

        &:hover {
            color: #b2b2b2;
        }
    }

    :global(body) {
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

        @media only screen and (max-width: 800px) {
            width: 100%;
        }
    }
</style>
