import React from 'react';
import PageTitle from '../components/PageTitle';
import { MOCK_STAFF_DATA } from '../constants';
import { StaffMember } from '../types';
import { Link } from 'react-router-dom';

const StaffCard: React.FC<{ member: StaffMember }> = ({ member }) => (
  <div className="bg-dark-bg/50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-center border border-dark-border hover:border-main-green">
    {member.imageUrl && (
      <img 
        src={member.imageUrl} 
        alt={member.name} 
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-main-green shadow-md" 
      />
    )}
    <h3 className="text-xl font-bold text-light-text">{member.name}</h3>
    <p className="font-semibold text-highlight-gold">{member.role}</p>
    {member.bio && <p className="text-sm text-secondary-text mt-2">{member.bio}</p>}
  </div>
);

const StaffPage: React.FC = () => {
  return (
    <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
      <PageTitle title="Our Team" subtitle="Meet the dedicated individuals running the Bowling Green Futsal League." />
      
      {MOCK_STAFF_DATA.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {MOCK_STAFF_DATA.map(member => (
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <p className="text-center text-secondary-text py-6">Staff information is currently unavailable. Please check back later.</p>
      )}
      
      <div className="mt-16 text-center bg-dark-bg/30 p-8 rounded-lg border border-dark-border">
        <h2 className="font-display text-3xl font-bold text-light-text mb-3">Want to Help?</h2>
        <p className="text-secondary-text max-w-2xl mx-auto mb-6">
          Interested in helping out? We're often looking for volunteers to assist with game days, events, and other league activities. 
          If you're passionate about futsal and want to contribute to our community, please get in touch!
        </p>
        <Link 
            to="/contact" 
            className="inline-block bg-main-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-main-green-dark shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
            Contact Us
        </Link>
      </div>
    </div>
  );
};

export default StaffPage;