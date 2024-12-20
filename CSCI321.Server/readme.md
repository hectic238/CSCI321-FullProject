Security Considerations:

During the development and testing phases of this project, the website was accessed using a self-signed SSL certificate, which resulted in a "Not Secure" browser warning. This was a temporary measure to enable HTTPS testing without incurring costs for a trusted certificate.

In a real-world production environment, the following steps would be taken to ensure full SSL security:

Register a custom domain name.

Use AWS Certificate Manager (ACM) to issue a trusted SSL certificate.

Set up an Elastic Load Balancer to terminate SSL at the load balancer level.

These steps would ensure end-to-end encryption, secure connections, and improved user trust.