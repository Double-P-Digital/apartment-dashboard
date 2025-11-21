export const saveApartment = async (apartmentData) => {
    try {
        const response =  await fetch('http://localhost:3000/api/apartments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'supersecretinternalapikey'
            },
            body: JSON.stringify(apartmentData)
        });

        return await response.json();
    } catch (error) {
        return error;
    }
}

export const getApartments = async () => {
    try {
        const response =  await fetch('http://localhost:3000/api/apartments/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'supersecretinternalapikey'
            },
        });

        return await response.json();
    }
    catch (error) {
        return error;
    }
}

export const updateApartment = async (apartmentData) => {
    try {
        const response =  await fetch(`http://localhost:3000/api/apartments/${apartmentData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'supersecretinternalapikey'
            },
            body: JSON.stringify(apartmentData)
        });

        return await response.json();
    } catch (error) {
        return error;
    }
}

export const deleteApartment = async (apartmentId) => {}