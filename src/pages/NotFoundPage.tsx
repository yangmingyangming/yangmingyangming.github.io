import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <p>404 / NOT FOUND</p>
      <h1>这里没有<br />你要找的页面。</h1>
      <Link to="/"><ArrowLeft size={18} /> 返回首页</Link>
    </main>
  );
}
