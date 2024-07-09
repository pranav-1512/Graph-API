import React, { useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';

const id = "1677858482954106";

const Login = ({ onLogin }) => {
    const responseFacebook = (response) => {
        if (response.accessToken) {
            onLogin(response.accessToken);
        } else {
            console.log('Facebook login unsuccessful:', response);
        }
    };

    const handleFacebookError = (error) => {
        console.error("Facebook Login Error:", error);
    };

    useEffect(() => {
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: id, // Use your app ID here
                cookie: true,
                xfbml: true,
                version: 'v13.0'
            });
          
            window.FB.getLoginStatus(function(response) {
                console.log("FB.getLoginStatus response:", response);
                if (response.status === 'connected') {
                    console.log("User is logged in and authenticated");
                } else if (response.status === 'not_authorized') {
                    console.log("User is logged in to Facebook but not authenticated");
                } else {
                    console.log("User is not logged in to Facebook");
                }
            });
        };
      
        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    return (
        <div>
            <h2>Login with Facebook</h2>
            <FacebookLogin
                appId={id}
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook}
                onFailure={handleFacebookError}
                disableMobileRedirect={true}
                scope="public_profile,email,pages_show_list,pages_read_engagement"
            />
        </div>
    );
};

export default Login;