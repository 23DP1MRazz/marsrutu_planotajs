import { Link } from '@inertiajs/react';
import { login } from '@/routes';

export function AuthButton() {
    return (
        <Link href={login()} className="btn btn-primary">
            Pierakstīties
        </Link>
    );
}
