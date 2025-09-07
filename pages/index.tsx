import { GetServerSideProps } from 'next';

function HomePage() {
  // Esta página nunca se renderizará porque siempre redirigimos
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/auth/signin',
      permanent: false,
    },
  };
};

export default HomePage;
