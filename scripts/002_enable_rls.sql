-- Enable Row Level Security on all tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for members table (allow all operations for authenticated users)
CREATE POLICY "Allow authenticated users to view members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update members" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete members" ON public.members FOR DELETE USING (true);

-- Create policies for savings_transactions table
CREATE POLICY "Allow authenticated users to view savings" ON public.savings_transactions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert savings" ON public.savings_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update savings" ON public.savings_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete savings" ON public.savings_transactions FOR DELETE USING (true);

-- Create policies for loans table
CREATE POLICY "Allow authenticated users to view loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert loans" ON public.loans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update loans" ON public.loans FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete loans" ON public.loans FOR DELETE USING (true);

-- Create policies for loan_payments table
CREATE POLICY "Allow authenticated users to view loan payments" ON public.loan_payments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert loan payments" ON public.loan_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update loan payments" ON public.loan_payments FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete loan payments" ON public.loan_payments FOR DELETE USING (true);

-- Create policies for donations table
CREATE POLICY "Allow authenticated users to view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update donations" ON public.donations FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete donations" ON public.donations FOR DELETE USING (true);

-- Create policies for expenses table
CREATE POLICY "Allow authenticated users to view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete expenses" ON public.expenses FOR DELETE USING (true);
