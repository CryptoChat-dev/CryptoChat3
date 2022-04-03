<script lang="ts">
    export let override: () => void;
    export let dismiss: () => void;
</script>

<!-- The Modal -->
<div class="dialog__modal">
    <!-- Modal content -->
    <div class="dialog__content">
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
