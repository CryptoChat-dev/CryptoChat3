<script lang="ts">
    export let override: () => void;
    export let dismiss: () => void;
</script>

<!-- The Modal -->
<div class="modal">
    <!-- Modal content -->
    <div class="content">
        <h1>Weak Key</h1>
        <p>
            The room key you entered is insecure and could leave your chats
            vulnerable. It is recommended to use the dice button.
        </p>
        <b>Continue anyways?</b>

        <div
            style="display: flex; justify-content: space-between; margin-top: 1rem;"
        >
            <button on:click={dismiss}>Abort</button>
            <button class="danger" on:click={override}>Override</button>
        </div>
    </div>
</div>

<style lang="scss">
    /* The Modal (background) */
    .modal {
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
    }

    /* Modal Content */
    .content {
        background-color: var(--modal-color);
        margin: auto;
        padding: 1rem;

        width: 20rem;
        border-radius: 10px;

        color: var(--txt-color);
        margin-top: 20%;
        text-align: center;
    }
</style>
