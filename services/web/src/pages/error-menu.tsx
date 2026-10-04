export default function ErrorMenu({errorMsg}: {errorMsg: string}): React.JSX.Element {
    return (
        <section className="error-section">
            <h1>Oops...</h1>
            <h2>{errorMsg} Please restart website!</h2>
        </section>
    )
}