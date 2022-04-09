<script lang="ts">
    import type Dexie from "dexie";
    import { onMount } from "svelte";

    export let dismiss: () => void;

    export let db: Dexie;

    // get db entries
    const getHistory = async () => {
        return (await db["history"].toArray()).reverse();
    };

    let history: Array<{ username: string; key: string; timestamp: number }> =
        [];

    onMount(() => {
        getHistory().then((data) => {
            history = data;
        });
    });
</script>

<!-- The Modal -->
<div class="dialog__modal">
    <!-- Modal content -->
    <div class="dialog__content">
        <h1>History</h1>
        <p>History entries are kept locally.</p>
        <div class="display: flex; flex-direction: column; align-items: center;">
            {#each history as entry}
                <div class="historyBlock">
                    <p class="historyDetail" style="color: grey;">
                        {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <p class="historyDetail">{entry.username}</p>
                    <p class="historyDetail">{entry.key}</p>
                </div>
            {/each}
        </div>
        <div style="display: flex; justify-content: center; margin-top: 1rem;">
            <button on:click={dismiss}>Ok</button>
        </div>
    </div>
</div>

<style lang="scss">
    .historyDetail {
        margin: 0.5rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-align: left;
    }

    .historyBlock {
        width: 20rem;
        background-color: black;
        border-radius: 10px;
        height: fit-content;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);

        @media only screen and (max-width: 800px) {
            width: 90%;
        }
    }
</style>
