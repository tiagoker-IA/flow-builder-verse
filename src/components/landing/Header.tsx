import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-medium text-gradient-gold">LogosFlow</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('section:nth-of-type(3)')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Modos
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/auth")}
              className="hidden sm:inline-flex"
            >
              Entrar
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Começar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
