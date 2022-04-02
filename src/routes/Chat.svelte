<script lang="ts">
    import { SHA512 } from "jscrypto/es6/SHA512";

    import FaArrowAltCircleUp from "svelte-icons/fa/FaArrowAltCircleUp.svelte";
    // get username and roomKey from localStorage
    const username: string = window.localStorage.getItem("username");
    const roomKey: string = window.localStorage.getItem("roomKey");

    // hash the roomKey with SHA-512
    const hashedRoomKey: string = SHA512.hash(roomKey).toString();
</script>

<div class="container">
    <div class="infoBar">
        <div class="keyInfo">
            <p>Room Key:</p>
            <p class="roomKey">{roomKey}</p>
        </div>
    </div>
    <div class="titles">
        <h1 style="margin: 0; font-size: 3rem;">CryptoChat</h1>
        <h2 style="margin: 0;">A stunning encrypted webapp.</h2>
    </div>
    <div class="chatBox" />
    <div class="messageBox">
        <input class="messageInput override" placeholder="What's up?" />
        <div class="inputIcon icon">
            <FaArrowAltCircleUp />
        </div>
    </div>
    <div class="buttons">
        <button>Theme</button>
        <button>Leave</button>
    </div>
</div>

<style lang="scss">

    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
    }
    
    .inputIcon {
        color: white;
        padding: 0.5rem;
        border-radius: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .messageBox {
        height: fit-content;
        display: flex;
        margin-top: 1rem;

        border-radius: 25px;
        box-shadow: inset 8px 8px 8px var(--inside-box-shadow-one),
            inset -8px -8px 8px var(--inside-box-shadow-two);

        align-items: center;
    }

    .messageInput {
        width: 100%;
        background: transparent;
        border: none;

        color: white;

        &:focus {
            outline: none;
        }

        padding: 20px 20px 20px 20px;

        font-size: 1rem;
    }

    .container {
        /* height: 45rem; */
        height: fit-content;
        width: 50rem;
        border-radius: 50px;
        background: var(--main-background);
        box-shadow: 20px 20px 60px var(--first-box-shadow),
            -20px -20px 60px var(--second-box-shadow);

        display: flex;
        flex-direction: column;
        padding: 1.5rem 2.5rem 1.5rem 2.5rem;
    }

    .infoBar {
        display: flex;
        width: 100%;
        height: 3rem;
    }

    .keyInfo {
        display: flex;
    }

    .roomKey {
        margin-left: 0.5rem;

        // blur
        filter: blur(5px);

        transition-duration: 250ms;

        &:hover {
            filter: none;
        }
    }

    .titles {
        display: flex;
        flex-direction: column;
    }

    .chatBox {
        /* height: 40%; */
        height: 20rem;
        border-radius: 25px;
        box-shadow: inset 8px 8px 8px var(--inside-box-shadow-one),
            inset -8px -8px 8px var(--inside-box-shadow-two);
        width: 98%;
        border: none;
        outline: none;
        background: none;
        font-size: 18px;
        padding: 20px 10px 20px 9px;
        overflow-y: auto;
        overflow-x: hidden;
        color: var(--txt-color);
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
    }
</style>
