import React, { useState } from 'react';

const AddMemberDialog = ({ open, onClose, onAddMember }) => {
    const [formData, setFormData] = useState({ name: '' }); // Removed email from state initialization

    const resetFormData = () => {
        setFormData({ name: '' }); // Removed email from reset
    };

    const handleSubmit = async () => {
        // Removed email from insert query
        await insertMember({ name: formData.name });
        resetFormData();
        onClose();
    };

    return (
        <div>
            <h2>Add Member</h2>
            <label>Name:</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <button onClick={handleSubmit} disabled={!formData.name}>Add</button> {/* Updated button disabled condition */}
        </div>
    );
};

export default AddMemberDialog;