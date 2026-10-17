import './App.css';
import Router from './router/index';
import McpBridge from './mcp/McpBridge';

function App() {
  return (
    <div className="App">
      <Router />
      <McpBridge />
    </div>
  );
}

export default App;
