
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Pagina non trovata</p>
        <p className="text-gray-500 mb-8">
          La pagina "{location.pathname}" non esiste o è stata spostata.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={goBack} variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna indietro
          </Button>
          <Button asChild variant="default">
            <a href="/">Homepage</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
