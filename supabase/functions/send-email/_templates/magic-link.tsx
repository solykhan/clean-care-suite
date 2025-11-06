import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Log in to Hygiene Facility Management</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hygiene Facility Management</Heading>
        <Text style={text}>
          Hello! You requested to log in to the Hygiene Facility Management system.
        </Text>
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={{
            ...button,
            display: 'inline-block',
            marginBottom: '24px',
          }}
        >
          Click here to log in
        </Link>
        <Text style={{ ...text, marginBottom: '14px' }}>
          Or, copy and paste this temporary login code:
        </Text>
        <code style={code}>{token}</code>
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '14px',
            marginBottom: '16px',
          }}
        >
          If you didn&apos;t request this login link, you can safely ignore this email.
        </Text>
        <Text
          style={{
            ...text,
            color: '#ababab',
            fontSize: '12px',
            marginTop: '24px',
          }}
        >
          This link will expire in 1 hour for security reasons.
        </Text>
        <Text style={footer}>
          Hygiene Facility Management System
          <br />
          Streamline your customer management and service agreements
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}

const h1 = {
  color: '#129fb0',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#129fb0',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 40px',
  marginLeft: '40px',
  marginRight: '40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 40px',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
  marginBottom: '24px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const code = {
  display: 'inline-block',
  padding: '16px 20px',
  width: '85%',
  marginLeft: '40px',
  marginRight: '40px',
  backgroundColor: '#f4f4f4',
  borderRadius: '6px',
  border: '1px solid #ddd',
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
}
