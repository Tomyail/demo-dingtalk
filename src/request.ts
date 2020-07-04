export default (inUrl: string, inOptions?: any): Promise<any> => {
    return fetch(
        inUrl,
        {
            headers: {
                corpid: 'ding41b4dab8436fe2ffa1320dcb25e91351',
                'Content-Type': 'application/json'
            },
            ...inOptions
        }
    ).then(res => res.json());
}