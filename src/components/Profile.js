import React from 'react';

const Profile = ({ user }) => {
  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      {user.picture && user.picture.data && (
        <img src={user.picture.data.url} alt={user.name} />
      )}
    </div>
  );
};

export default Profile;