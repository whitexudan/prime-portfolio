import {redirect} from 'next/navigation';

export default function AdminReviewsRedirect():never{
 redirect('/admin?section=reviews');
}
