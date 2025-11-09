import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Syndic.us. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data and tell you about 
              your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
            <p className="text-muted-foreground mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Identity Data: name, username, coaching credentials</li>
              <li>Contact Data: email address, phone number</li>
              <li>Technical Data: IP address, browser type, device information</li>
              <li>Usage Data: how you interact with our PersonaBots and platform</li>
              <li>Profile Data: coaching preferences, areas of expertise</li>
              <li>Communication Data: conversations with PersonaBots and support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
            <p className="text-muted-foreground mb-4">We use your personal data to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain our PersonaBot services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Improve our AI models and coaching recommendations</li>
              <li>Send you relevant updates and marketing communications</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and maintain platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal data. We may share your data with service providers who help us 
              operate our platform (payment processors, hosting providers, AI infrastructure). All third 
              parties are required to maintain the confidentiality and security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. AI and PersonaBot Data</h2>
            <p className="text-muted-foreground">
              Conversations with PersonaBots are processed by our AI systems to provide coaching guidance. 
              For coaches: your content is used to train your specific PersonaBot but remains your intellectual 
              property. We implement safeguards to prevent your coaching IP from being used in other PersonaBots.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal data, 
              including encryption, secure servers, and regular security audits. However, no internet 
              transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please contact us at 
              privacy@syndic.us or visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
