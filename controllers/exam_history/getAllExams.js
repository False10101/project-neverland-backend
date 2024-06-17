import database from "../../database/database.js";
import { format } from 'date-fns-tz';

export const getAllExams = (req, res) => {

    const uid = req.userId;

    if (!uid) {
        return res.status(401).json({ success: false, message: 'Please log in' });
    }

    database.query('SELECT * FROM exam_history WHERE uid = ?', [uid], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        const adjustedResult = result.map(exam => ({
            ...exam,
            exam_date: format(new Date(exam.exam_date), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Bangkok' }),
        }));

        return res.json({ success: true, data: adjustedResult, error: null });
    });
};
