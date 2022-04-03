const switchTheme = () => {
    const currentTheme: string = window.localStorage.getItem("theme") || "dark";
    window.localStorage.setItem(
        "theme",
        currentTheme === "dark" ? "light" : "dark"
    );
    document.documentElement.setAttribute(
        "data-theme",
        currentTheme === "dark" ? "light" : "dark"
    );
};

export default switchTheme;