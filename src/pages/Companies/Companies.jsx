import { useEffect, useState } from "react";
import { getCompanies } from "../../services/company.service";

function Companies() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        loadCompanies();
    }, []);

    async function loadCompanies() {
        try {
            const response = await getCompanies();
            setCompanies(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <h1>Companies</h1>

            {companies.map((company) => (
                <div key={company.id}>
                    {company.name}
                </div>
            ))}
        </div>
    );
}

export default Companies;