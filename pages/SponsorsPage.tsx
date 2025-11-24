import React, { useState } from 'react';
import PageTitle from '../components/PageTitle';
import { MOCK_SPONSOR_DATA, LEAGUE_NAME } from '../constants';
import { Sponsor } from '../types';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import { BuildingStorefrontIcon } from '../components/icons/BuildingStorefrontIcon';

const SponsorCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => (
  <div className="bg-dark-bg/50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-between border border-dark-border hover:border-main-green">
    <img 
      src={sponsor.logoUrl} 
      alt={`${sponsor.name} logo`} 
      className="max-h-24 w-auto object-contain mb-4 flex-grow"
    />
    <div className="text-center mt-auto">
      <h3 className="text-xl font-semibold text-light-text">{sponsor.name}</h3>
      {sponsor.tier && <p className="text-sm font-semibold text-highlight-gold mb-2">{sponsor.tier} Sponsor</p>}
      {sponsor.websiteUrl && (
        <a 
          href={sponsor.websiteUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-sm text-main-green hover:text-highlight-gold"
        >
          Visit Website <ExternalLinkIcon className="w-4 h-4 ml-1" />
        </a>
      )}
    </div>
  </div>
);

const SponsorsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
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
    const mailtoSubject = `Sponsorship Inquiry: ${encodeURIComponent(formData.companyName)}`;
    const mailtoBody = `Company Name: ${encodeURIComponent(formData.companyName)}%0D%0AContact Name: ${encodeURIComponent(formData.contactName)}%0D%0AEmail: ${encodeURIComponent(formData.email)}%0D%0APhone: ${encodeURIComponent(formData.phone || 'N/A')}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(formData.message)}`;
    
    const mailtoUrl = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    console.log('Sponsorship inquiry for mailto:', formData);
    console.log('Mailto URL:', mailtoUrl);

    window.location.href = mailtoUrl;

    await new Promise(resolve => setTimeout(resolve, 500)); 

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ companyName: '', contactName: '', email: '', phone: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };
  
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-main-green focus:border-main-green sm:text-sm bg-dark-bg text-light-text disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600";


  return (
    <div className="space-y-12">
      <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
        <PageTitle title="Our Valued Sponsors" subtitle={`Supporting the growth of futsal in Bowling Green, thanks to these great partners.`} />
        
        {MOCK_SPONSOR_DATA.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {MOCK_SPONSOR_DATA.map(sponsor => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary-text py-6">We are currently seeking sponsors! Your support can make a huge difference.</p>
        )}
      </div>

      <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
        <PageTitle title="Become a Sponsor" subtitle={`Partner with ${LEAGUE_NAME} and reach a passionate local audience.`} />

        <div className="prose prose-lg max-w-none text-secondary-text mb-8">
          <p>
            Sponsoring {LEAGUE_NAME} offers a unique opportunity to enhance your brand visibility within the local community, demonstrate your company's commitment to supporting local sports, and connect with a dedicated audience of players, families, and fans.
          </p>
          <p>
            We offer various sponsorship packages with benefits such as logo placement on our website and banners, social media mentions, and more. Fill out the form below to express your interest, and we'll get in touch with more details.
          </p>
        </div>

        {isSubmitted && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 text-green-300 rounded-md text-center shadow-sm">
            Your email client should have opened with the sponsorship inquiry details. Please complete sending the email there.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-secondary-text">Company Name</label>
            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} required className={inputClasses} disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-secondary-text">Contact Person</label>
            <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} required className={inputClasses} disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="email_sponsor" className="block text-sm font-medium text-secondary-text">Email Address</label>
            <input type="email" name="email" id="email_sponsor" value={formData.email} onChange={handleChange} required className={inputClasses} disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-secondary-text">Phone Number (Optional)</label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClasses} disabled={isSubmitting} />
          </div>
          <div>
            <label htmlFor="message_sponsor" className="block text-sm font-medium text-secondary-text">Message / Interest Level</label>
            <textarea name="message" id="message_sponsor" rows={3} value={formData.message} onChange={handleChange} className={inputClasses} disabled={isSubmitting}></textarea>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-main-green hover:bg-main-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-main-green disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Preparing Email...' : 'Submit Sponsorship Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorsPage;