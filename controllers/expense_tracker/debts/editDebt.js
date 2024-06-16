import database from "../../../database/database.js";

export const editDebt = (req, res) => {
    const uid = req.userId;
    const type = "debt";
    const { amount, category, method, payment_time, debt_status, comment, id } = req.body;

    if (!uid) {
        return res.status(401).json({ success: false, message: 'Please log in' });
    }

    database.beginTransaction((err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        const selectOldDebtQuery = 'SELECT amount FROM expense_tracker WHERE id = ? AND uid = ? AND type = ?';
        database.query(selectOldDebtQuery, [id, uid, type], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return database.rollback(() => {
                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                });
            }

            if (result.length === 0) {
                return database.rollback(() => {
                    return res.status(404).json({ success: false, message: 'Debt not found or unauthorized' });
                });
            }

            const oldAmount = result[0].amount;

            const updateDebtQuery = 'UPDATE expense_tracker SET amount = ?, category = ?, method = ?, payment_time = ?, debt_status = ?, comment = ? WHERE id = ? AND uid = ? AND type = ?';
            database.query(updateDebtQuery, [amount, category, method, payment_time, debt_status, comment, id, uid, type], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return database.rollback(() => {
                        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                    });
                }

                const selectTotalDebtQuery = 'SELECT total_debt FROM user_profile WHERE id = ?';
                database.query(selectTotalDebtQuery, [uid], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        return database.rollback(() => {
                            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                        });
                    }

                    const oldTotalDebt = result[0].total_debt;
                    const newTotalDebt = parseInt(oldTotalDebt) + (parseInt(amount) - parseInt(oldAmount));

                    const updateTotalDebtQuery = 'UPDATE user_profile SET total_debt = ? WHERE id = ?';
                    database.query(updateTotalDebtQuery, [newTotalDebt, uid], (err, result) => {
                        if (err) {
                            console.error('Database error:', err);
                            return database.rollback(() => {
                                return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                            });
                        }

                        database.commit((err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return database.rollback(() => {
                                    return res.status(500).json({ success: false, message: 'Database error', error: err.message });
                                });
                            }

                            return res.json({ success: true, data: result, error: null });
                        });
                    });
                });
            });
        });
    });
};
