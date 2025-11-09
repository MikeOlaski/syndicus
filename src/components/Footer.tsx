import { MessageSquare } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Find Coaches", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  "For Coaches": [
    { label: "Join Platform", href: "#" },
    { label: "Create Bot", href: "#" },
    { label: "Success Stories", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Syndic.us</span>
            </div>
            <p className="text-sm text-footer-foreground/80">
              Empowering coaches with AI-powered personabots for transformative client experiences.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-footer-foreground/80 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-footer-foreground/20 text-center text-sm text-footer-foreground/60">
          © 2025 Syndic.us. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
