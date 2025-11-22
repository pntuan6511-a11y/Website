export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as 0965 553 496 (4-3-3) or similar depending on length
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (cleaned.length === 11) {
        return cleaned.replace(/(\d{5})(\d{3})(\d{3})/, '$1 $2 $3');
    }

    return phone;
};
