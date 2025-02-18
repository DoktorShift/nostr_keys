import React, { useState } from "react";
import * as nostrTools from "nostr-tools";

// --- Shared Styled Components (using inline styles for simplicity) ---
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #141414, #2c2c2c)",
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "700px",
  padding: "30px",
  backgroundColor: "#1f1f1f",
  borderRadius: "15px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
  color: "#e0e0e0",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  marginBottom: "30px",
};

const headerStyle = {
  textAlign: "center",
  color: "#4dabf7",
  marginBottom: "15px",
  fontSize: "1.8rem",
};

const infoStyle = {
  backgroundColor: "#272727",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "25px",
  fontSize: "0.95rem",
  lineHeight: "1.6",
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "5px",
  display: "block",
  fontSize: "0.95rem",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "6px",
  border: "1px solid #444",
  backgroundColor: "#2c2c2c",
  color: "#e0e0e0",
  fontSize: "0.95rem",
};

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontSize: "0.95rem",
  marginRight: "10px",
  marginBottom: "10px",
});

const keyBoxStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#333",
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "15px",
  wordBreak: "break-all",
  fontFamily: "monospace",
};

const hexKeyTextStyle = {
  flexGrow: 1,
  color: "#ffeb3b",
  fontSize: "1.1rem",
};

const nipKeyTextStyle = {
  flexGrow: 1,
  color: "#4caf50",
  fontSize: "1rem",
};

const uriBoxStyle = {
  padding: "15px",
  backgroundColor: "#333",
  borderRadius: "6px",
  wordBreak: "break-all",
  fontFamily: "monospace",
  fontSize: "1rem",
  marginTop: "15px",
};

const detailsBoxStyle = {
  backgroundColor: "#2c2c2c",
  padding: "15px",
  borderRadius: "6px",
  fontSize: "0.9rem",
  lineHeight: "1.5",
  marginTop: "20px",
  color: "#c0c0c0",
};

// --- Main Component ---
export default function NostrKeyAndWalletConnectDemo() {
  // Client Key Pair (generated once)
  const [clientKeys, setClientKeys] = useState(null);
  // Toggle for showing the secret key in hex
  const [showPrivate, setShowPrivate] = useState(false);
  // For Wallet Connect URI generation
  const [relay, setRelay] = useState("");
  const [walletConnectURI, setWalletConnectURI] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  // --- Generate Client Nostr Key Pair ---
  // Uses secure cryptographic mechanisms: elliptic curve cryptography (secp256k1) and Bech32 (NIP-19) encoding.
  const generateClientKeys = () => {
    try {
      const sk = nostrTools.generateSecretKey(); // 32-byte private key (hex)
      const pk = nostrTools.getPublicKey(sk);      // Corresponding public key (hex)
      const npub = nostrTools.nip19.npubEncode(pk);  // Public key in NIP-19 format
      const nsec = nostrTools.nip19.nsecEncode(sk);  // Private key in NIP-19 format
      setClientKeys({ sk, pk, npub, nsec });
      // Clear any previously generated Wallet Connect URI
      setWalletConnectURI("");
    } catch (error) {
      console.error("Error generating client keys:", error);
    }
  };

  // --- Build Wallet Connect URI ---
  // Buho generates a unique key pair for each connection.
  // The URI is constructed using Buho’s public key and the client's secret key.
  const generateWalletConnectURI = () => {
    if (!clientKeys) {
      alert("Please generate your client Nostr keys first!");
      return;
    }
    if (!relay.trim()) {
      alert("Relay URL is required!");
      return;
    }

    try {
      // Simulate Buho generating a unique key pair per connection
      const buhoSK = nostrTools.generateSecretKey();
      const buhoPK = nostrTools.getPublicKey(buhoSK);

      // The client's secret key is used for signing and encryption.
      const clientSecret = clientKeys.sk;

      // Construct the URI in the following format:
      // nostr+walletconnect://<buhoPublicKey>?relay=<relay>&secret=<clientSecret>
      let uri = `nostr+walletconnect://${buhoPK}`;
      const params = new URLSearchParams();
      params.append("relay", relay);
      params.append("secret", clientSecret);
      uri += `?${params.toString()}`;

      setWalletConnectURI(uri);
    } catch (error) {
      console.error("Error generating Wallet Connect URI:", error);
    }
  };

  // --- Copy to Clipboard Helper ---
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed", err);
      setCopyMessage("Copy failed!");
    }
    setTimeout(() => setCopyMessage(""), 2000);
  };

  return (
    <div style={containerStyle}>
      {/* --- Client Nostr Key Generation Section --- */}
      <div style={cardStyle}>
        <h1 style={headerStyle}>Client Nostr Key Generator</h1>
        <div style={infoStyle}>
          <p>
            <strong>Overview:</strong>
            <br />
            This tool generates your unique Nostr key pair. Your <em>private key</em> (nsec) signs your events and must remain secret, while the <em>public key</em> (npub) identifies you on the network.
            <br />
            <strong>Technical Details:</strong> Uses elliptic curve cryptography (secp256k1) and Bech32 encoding (NIP-19) for secure key generation.
          </p>
        </div>
        {clientKeys ? (
          <>
            <div style={{ marginBottom: "25px" }}>
              <div style={labelStyle}>Client Public Key (Hex):</div>
              <div style={keyBoxStyle}>
                <span style={hexKeyTextStyle}>{clientKeys.pk}</span>
                <button onClick={() => copyToClipboard(clientKeys.pk)} style={buttonStyle("#4dabf7")}>
                  Copy
                </button>
              </div>
              <div style={labelStyle}>Client Public Key (NIP-19):</div>
              <div style={keyBoxStyle}>
                <span style={nipKeyTextStyle}>{clientKeys.npub}</span>
                <button onClick={() => copyToClipboard(clientKeys.npub)} style={buttonStyle("#4dabf7")}>
                  Copy
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "25px" }}>
              <div style={labelStyle}>Client Private Key (Hex):</div>
              <div style={keyBoxStyle}>
                <span style={hexKeyTextStyle}>
                  {showPrivate ? clientKeys.sk : "••••••••••••••••••••••••••••••••••••"}
                </span>
                <button
                  onClick={() => setShowPrivate(!showPrivate)}
                  style={buttonStyle("#4dabf7")}
                  title="Toggle Private Key Visibility"
                >
                  {showPrivate ? "Hide" : "Show"}
                </button>
                <button onClick={() => copyToClipboard(clientKeys.sk)} style={buttonStyle("#4dabf7")}>
                  Copy
                </button>
              </div>
              <div style={labelStyle}>Client Private Key (NIP-19):</div>
              <div style={keyBoxStyle}>
                <span style={nipKeyTextStyle}>
                  {showPrivate ? clientKeys.nsec : "••••••••••••••••••••••••••••••••••••"}
                </span>
                <button onClick={() => copyToClipboard(clientKeys.nsec)} style={buttonStyle("#4dabf7")}>
                  Copy
                </button>
              </div>
            </div>
            <button onClick={generateClientKeys} style={buttonStyle("#4dabf7")}>
              Regenerate Client Keys
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={generateClientKeys} style={buttonStyle("#4dabf7")}>
              Generate Your Client Nostr Keys
            </button>
          </div>
        )}
      </div>

      {/* --- Wallet Connect URI Section --- */}
      <div style={cardStyle}>
        <h1 style={headerStyle}>Buho Wallet Connect URI Generator</h1>
        <div style={infoStyle}>
          <p>
            <strong>Workflow:</strong>
            <br />
            Every time a connection is created, Buho (your NWC string generator) generates a unique Nostr key pair.
            The generated URI uses Buho’s public key to identify the wallet service and your client’s secret key for signing and encryption.
          </p>
        </div>
        <div>
          <label style={labelStyle}>Relay URL (required):</label>
          <input
            type="text"
            placeholder="wss://relay.example.com"
            style={inputStyle}
            value={relay}
            onChange={(e) => setRelay(e.target.value)}
          />

          <button onClick={generateWalletConnectURI} style={buttonStyle("#4dabf7")}>
            Generate URI
          </button>
        </div>

        {walletConnectURI && (
          <>
            <h2 style={{ ...headerStyle, fontSize: "1.4rem", marginTop: "25px" }}>
              Generated URI
            </h2>
            <div style={uriBoxStyle}>{walletConnectURI}</div>
            <button onClick={() => copyToClipboard(walletConnectURI)} style={buttonStyle("#4dabf7")}>
              Copy URI
            </button>
            {copyMessage && (
              <span style={{ marginLeft: "10px", color: "#4caf50" }}>{copyMessage}</span>
            )}

            {/* --- Details Box --- */}
            <div style={detailsBoxStyle}>
              <strong>URI Details:</strong>
              <br />
              <code>nostr+walletconnect://&lt;buhoPublicKey&gt;?relay=&lt;relay&gt;&amp;secret=&lt;clientSecret&gt;</code>
              <br /><br />
              <strong>Components:</strong>
              <ul style={{ margin: "5px 0 0 20px" }}>
                <li>
                  <code>nostr+walletconnect://</code>: Specifies the protocol for Nostr Wallet Connect.
                </li>
                <li>
                  <code>&lt;buhoPublicKey&gt;</code>: The unique public key generated by Buho for this connection.
                </li>
                <li>
                  <code>relay=&lt;relay&gt;</code>: A required query parameter specifying the relay URL where messages are exchanged.
                </li>
                <li>
                  <code>secret=&lt;clientSecret&gt;</code>: A required query parameter containing your client’s private key (in hex) for signing and encryption.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
