import React from 'react';

const Footer = () => {
  return (
    <div className="footer-wrapper" style={{ width: '100%', padding: '0 40px 40px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="footer">
        <div>© 2026 나라장터 공고 알림 서비스. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">고객센터</a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
