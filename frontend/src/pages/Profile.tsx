import React from 'react';
import styled from 'styled-components';


const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

const ComingSoon = styled.div`
  background: linear-gradient(145deg, #1E1E2D, #252535);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #6366F1, #A855F7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #8A8AA3;
    font-size: 1.1rem;
    max-width: 500px;
    margin: 0 auto;
  }
`;

const Profile: React.FC = () => {
  return (
    <Container>
      <Title>Profile</Title>
      <ComingSoon>
        <h2>Coming Soon</h2>
        <p>The profile page is currently under development. You'll be able to manage your account settings here soon.</p>
      </ComingSoon>
    </Container>
  );
};

export default Profile;