import React, { useState, useCallback } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../apiService/authService";
const { Title, Text } = Typography;

interface LoginScreenProps {
  onLoginSuccess: (token: string, username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm(); // For resetting form fields

  const onFinishLogin = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        const response = await authService.login({
          username: values.username,
          password: values.password,
        });

        // If login is successful, the service returns the token and username
        message.success("Login successful!");
        localStorage.clear();
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("username", response.user.username);
        onLoginSuccess(response.token, response.user.username);
        navigate("/");
      } catch (error: any) {
        // The authService now handles detailed error messages
        alert(error.message || "An unexpected error occurred during login.");
      } finally {
        setLoading(false);
      }
    },
    [onLoginSuccess, navigate]
  );

  const onFinishRegister = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        // Use the authService for registration
        const successMessage = await authService.register({
          username: values.username,
          password: values.password,
          email: values.email,
        });

        message.success(successMessage);
        setIsRegisterMode(false); // Switch to login mode
        form.resetFields(); // Clear form fields
      } catch (error: any) {
        // The authService now handles detailed error messages
        message.error(
          error.message || "An unexpected error occurred during registration."
        );
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <Card
        style={{ width: 400, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        title={
          <Title level={4} style={{ textAlign: "center", margin: 0 }}>
            {isRegisterMode ? "Register" : "Login"} to TradeSmart
          </Title>
        }
      >
        <Form
          form={form}
          name={isRegisterMode ? "register" : "login"}
          initialValues={{ remember: true }}
          onFinish={isRegisterMode ? onFinishRegister : onFinishLogin}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {isRegisterMode && (
            <>
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your Password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your E-mail Address!" },
                  { type: "email", message: "The input is not valid E-mail!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ marginBottom: "10px" }}
            >
              {isRegisterMode ? "Register" : "Login"}
            </Button>
            <Text>
              {isRegisterMode
                ? "Already have an account?"
                : "Don't have an account?"}
              <Button
                type="link"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  form.resetFields(); // Clear form fields when switching modes
                }}
                disabled={loading}
              >
                {isRegisterMode ? "Login now!" : "Register now!"}
              </Button>
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginScreen;
