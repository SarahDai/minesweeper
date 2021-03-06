import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { Input, FormFeedback, Spinner, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { requestAllUsernames, requestRegister, requestLogin, setPage } from "../../redux/actions/connectActions";
import { SIGN_UP_STATE, PAGE } from "../../redux/storeConstants";
import { ALERT_MSG_TIME, EMPTY } from "../../views/App";

let beginEdit = false;

const isExisting = (username, allUsernames) => {
   return allUsernames.includes(username);
}

const SignUpPage = () => {
   const [username, setUsername] = useState(EMPTY);
   const [password1, setPassword1] = useState(EMPTY);
   const [password2, setPassword2] = useState(EMPTY);
   const [showAlert, setShowAlert] = useState(false);

   const registerStatus = useSelector(state => state.user.registerStatus);
   const existingUsernames = useSelector(state => state.user.existingUsernames);
   const dispatch = useDispatch();

   let canSignUp = username.length > 0 && password1.length > 0 && password1 === password2;

   const clearForm = () => {
      setUsername(EMPTY);
      setPassword1(EMPTY);
      setPassword2(EMPTY);
   }

   const handleSubmit = () => {
      beginEdit = false;
      setShowAlert(true);
   }

   useEffect(() => {
      dispatch(requestAllUsernames());
   }, [username, dispatch]);

   useEffect(() => {
      if (showAlert) {
         const timer = setTimeout(() => setShowAlert(false), ALERT_MSG_TIME);
         return () => clearTimeout(timer);
      }
   }, [showAlert]);

   const handleSignUp = () => {
      handleSubmit();
      dispatch(requestRegister(username, password2));
      setTimeout(() => {
         dispatch(requestLogin(username, password2));
         clearForm();
      }, ALERT_MSG_TIME);
   }

   const handleKeyPress = event => {
      if (event.keyCode === 13) {
         event.preventDefault();
         handleSignUp();
      }
   }

   const handleAlert = () => {
      if (!beginEdit) {
         if (registerStatus === SIGN_UP_STATE.NETWORK_ERROR) {
            return (
               <Alert variant="danger">
                  Unable to connect to the server! Please check your internet connection and try again.
               </Alert>
            );
         } else if (registerStatus === SIGN_UP_STATE.SIGNED_UP_SUCCESS) {
            return (
               <Alert variant="success">
                  Successfully signed up! Directing you to the lobby...
               </Alert>
            );
         }
      }
   }

   return (
      <Card 
         className="margin-auto margin-top-4 account-width">
         <Card.Header className="text-center text-dark">
            <h1>Create your account</h1>
         </Card.Header>
         <Card.Body>
         {
            showAlert &&
            <Row className="margin-bottom-1">
               <Col>
                  {handleAlert()}
               </Col>
            </Row>
         }
         {
            registerStatus === SIGN_UP_STATE.SIGNED_UP_REQUESTED &&
            <Row className="margin-bottom-1 margin-auto">
               <Col sm={4}/>
               <Col sm={4}>
                  <Spinner color="success" style={{width: "6rem", height: "6rem"}}/>
               </Col>
               <Col sm={4}/>
            </Row>
         }
         
         <Row>
            <Col>
               <Input type="text" id="username"
                      name="username" value={username}
                      className="input-size"
                      onKeyUp={e => handleKeyPress(e)}
                      aria-label="input-username"
                      valid={username.length > 0 && !isExisting(username, existingUsernames)}
                      invalid={isExisting(username, existingUsernames)}
                      onChange={e => {
                         beginEdit = true;
                         setUsername(e.target.value);
                      }}
                      placeholder="Username"
               />
               <FormFeedback valid>Sweet! that username is available </FormFeedback>
               <FormFeedback>Oh noes! that name is already taken</FormFeedback>
            </Col>
         </Row>
         <br />
         <Row>
            <Col>
               <Input type="password" id="password1"
                      className="input-size"
                      name="password" value={password1}
                      onKeyUp={e => handleKeyPress(e)}
                      aria-label="input-password"
                      placeholder="Password"
                      onChange={e => {
                         beginEdit = true;
                         setPassword1(e.target.value);
                      }}
               />
            </Col>
         </Row>
         <br />
         <Row>
            <Col>
               <Input type="password" id="password2"
                      className="input-size"
                      name="password" value={password2}
                      onKeyUp={e => handleKeyPress(e)}
                      aria-label="input-password"
                      placeholder="Confirm Password"
                      invalid={password2.length > 0 && password1 !== password2}
                      onChange={e => {
                         beginEdit = true;
                         setPassword2(e.target.value);
                      }}
               />
               <FormFeedback>Password doesn't match.</FormFeedback>
            </Col>
         </Row>
         </Card.Body>
         <Card.Footer>
         <Row>
            <Col>
               <Button disabled={!canSignUp}
                  className="login-button-margin login-font-size input-size" block
                  variant="primary" onClick={()=>handleSignUp()}>
                  Finish
               </Button>
            </Col>
         </Row>
         <Row>
            <Button variant="light"
               className="text-primary link-style" block
               onClick={()=>dispatch(setPage(PAGE.LOGIN))}>
               Already have an account? Sign in here.
            </Button>
         </Row>
         </Card.Footer>   
      </Card>
   );
}

export default SignUpPage;