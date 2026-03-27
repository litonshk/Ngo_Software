import React from 'react';
import { useForm } from 'react-hook-form';

const MemberForm = () => {
    const { register, handleSubmit } = useForm();
    const onSubmit = data => console.log(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Existing fields */}
            <div>
                <label>Village</label>
                <input {...register('village')} />
            </div>
            <div>
                <label>Post</label>
                <input {...register('post')} />
            </div>
            <div>
                <label>Police Station</label>
                <input {...register('policeStation')} />
            </div>
            <div>
                <label>District</label>
                <input {...register('district')} />
            </div>
            <input type="submit" />
        </form>
    );
};

export default MemberForm;