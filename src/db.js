import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: '192.168.101.227',
    user: 'public',
    password: '',
    database: 'iptv'  // DB 이름 변경
});

export default pool;
