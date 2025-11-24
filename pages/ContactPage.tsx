import React, { useState } from 'react';
import PageTitle from '../components/PageTitle';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recipientEmail = 'austin.greer6@gmail.com';
    const mailtoSubject = `BGFutsal Contact Form: ${encodeURIComponent(formData.subject)}`;
    const mailtoBody = `Name: ${encodeURIComponent(formData.name)}%0D%0AEmail: ${encodeURIComponent(formData.email)}%0D%0ASubject: ${encodeURIComponent(formData.subject)}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`;
    
    const mailtoUrl = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    console.log('Form data for mailto:', formData);
    console.log('Mailto URL:', mailtoUrl);

    window.location.href = mailtoUrl;

    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' }); 
    setTimeout(() => setIsSubmitted(false), 5000); 
  };
  
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-main-green focus:border-main-green sm:text-sm bg-dark-bg text-light-text disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600";

  return (
    <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border max-w-2xl mx-auto">
      <PageTitle title="Get In Touch" subtitle="Have questions or feedback? We'd love to hear from you!" />

      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-md text-center shadow-sm">
          Your email client should have opened with the form details. Please complete sending the email there.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary-text">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClasses}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary-text">Email Address</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClasses}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-secondary-text">Subject</label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={inputClasses}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-secondary-text">Message</label>
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            className={inputClasses}
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-main-green hover:bg-main-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-main-green disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Preparing Email...' : 'Send Message'}
          </button>
        </div>
      </form>
      <div className="mt-8 text-center text-sm text-secondary-text">
        <p>Alternatively, you can email us directly at <a href="mailto:austin.greer6@gmail.com" className="text-main-green hover:text-highlight-gold underline">austin.greer6@gmail.com</a>.</p>
        <p>We typically respond within 1-2 business days.</p>
      </div>
    </div>
  );
};

export default ContactPage;