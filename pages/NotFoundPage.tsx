import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-10 bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
      <PageTitle title="404 - Page Not Found" />
      <img src="https://picsum.photos/seed/404page/500/300" alt="Lost ball bouncing away" className="mx-auto my-8 rounded-lg shadow-md w-full max-w-md object-cover opacity-75"/>
      <p className="text-xl text-secondary-text mb-8">
        Oops! The page you're looking for doesn't seem to exist.
      </p>
      <Link
        to="/"
        className="inline-block bg-main-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-main-green-dark shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;