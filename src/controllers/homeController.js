export const getHomePage = (req, res) => {
    const mainStyles = "display: flex; flex-direction: column; align-items: center; justify-content: center; justify-content: center;";
    const titleStyles = "color: #01887c";
    const versionStyles = "font-size: 1.5rem";

    res.send(`
       <main style="${mainStyles}">
           <h1 style="${titleStyles}">WELCOME TO THE SERVER!</h1>
           <h5 style="${versionStyles}">version <i>2.1.1</i></h5>
       </main>
    `);
}