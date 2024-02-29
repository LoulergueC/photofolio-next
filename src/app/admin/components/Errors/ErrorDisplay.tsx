import "./ErrorDisplay.css";
export default function ErrorDisplay({error, setError}: any) {

  return <>{error && (<div className="error"><p>{error}</p><div className="error_close" onClick={() => setError("")}>x</div></div>)}</>;
}