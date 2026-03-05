import Button from "../components/ui/Button.tsx";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
            <h1 className="text-9xl font-black text-gray-200">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Nie znaleziono strony</h2>
            <p className="text-gray-500 mt-2 mb-8">Przepraszamy, ale strona, której szukasz.</p>
            <Button variant="primary" onClick={() => navigate('/')}>Wróć na stronę główną</Button>
        </div>
    );
}