<script lang="ts">
    export let fileName: string = "your file";

    import FaPaperPlane from "svelte-icons/fa/FaPaperPlane.svelte";
    import { BarLoader } from "svelte-loading-spinners";
</script>

<!-- The Modal -->
<div class="dialog__modal">
    <!-- Modal content -->
    <div class="dialog__content">
        <div class="parent">
            <div class="icon">
                <FaPaperPlane />
            </div>
        </div>
        <h1>Uploading file...</h1>
        <p>
            Please standby while <b>{fileName}</b> is being end-to-end encrypted
            and uploaded to the server.
        </p>
        <div class="parent">
            <BarLoader color="#4B4B4B" />
        </div>
    </div>
</div>

<style lang="scss">
    .parent {
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .icon {
        width: 5rem;
        height: 5rem;
    }
</style>
