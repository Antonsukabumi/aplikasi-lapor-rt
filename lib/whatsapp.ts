export async function sendWhatsappMessage(target: string, message: string) {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
        console.warn('FONNTE_TOKEN is not set. WhatsApp notification skipped.');
        return false;
    }

    try {
        const formData = new FormData();
        formData.append('target', target);
        formData.append('message', message);

        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                Authorization: token,
            },
            body: formData,
        });

        const result = await response.json();

        if (!result.status) {
            console.error('Fonnte API Error:', result);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        return false;
    }
}
