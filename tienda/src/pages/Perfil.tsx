import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Registration from "../ui/Registration";
import UserInfo from "../ui/UserInfo";
import Container from "../ui/Container";
import Loading from "../ui/Loading";

const Perfil = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, fetch additional user info if needed
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container>
      {currentUser ? (
        <UserInfo currentUser={currentUser} />
      ) : (
        <Registration />
      )}
    </Container>
  );
};

export default Perfil;