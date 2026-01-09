import { ThemeToggle } from "@/components/ThemeToggle";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border bg-muted/30">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-medium text-gradient-gold">LogosFlow</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>© {currentYear} LogosFlow</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Desenvolvido com fé e tecnologia</span>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
